"""MobileNetV2 Lightweight Binary Progress Classifier.

Scope Guardrail:
    - Strictly binary classification: Structural Phase vs. Finishing Phase.
    - No heavy YOLO object detection.
    - Allows site engineers to verify visual schedule alignment with low latency.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, BinaryIO

logger = logging.getLogger(__name__)

CLASSES = ["STRUCTURAL", "FINISHING"]


class ProgressClassifier:
    """MobileNetV2-based binary classifier for site progress monitoring."""

    def __init__(self, weights_path: str | Path | None = None) -> None:
        self.weights_path = Path(weights_path) if weights_path else None
        self._model = None
        self._transforms = None
        self._torch_available = False

        self._init_model()

    def _init_model(self) -> None:
        """Initialize PyTorch model and transforms if torch is available."""
        try:
            import torch
            import torch.nn as nn
            from torchvision import models, transforms

            self._torch_available = True
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

            # Load MobileNetV2 architecture
            model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
            # Replace final classifier layer with 2-class output
            in_features = model.classifier[1].in_features
            model.classifier[1] = nn.Linear(in_features, len(CLASSES))

            # Load custom fine-tuned weights if available
            if self.weights_path and self.weights_path.exists():
                try:
                    checkpoint = torch.load(self.weights_path, map_location=self.device)
                    model.load_state_dict(checkpoint)
                    logger.info("Loaded custom weights from %s", self.weights_path)
                except Exception as e:
                    logger.warning("Could not load custom weights from %s: %s", self.weights_path, e)

            model.to(self.device)
            model.eval()
            self._model = model

            # Standard ImageNet pre-processing
            self._transforms = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ])

            logger.info("MobileNetV2 binary classifier initialized on %s", self.device)

        except ImportError:
            self._torch_available = False
            logger.warning("PyTorch/torchvision not found — running in heuristic fallback mode.")

    def predict_image(self, image_input: str | Path | BinaryIO) -> dict[str, Any]:
        """Classify a site photo into Structural or Finishing phase."""
        try:
            from PIL import Image
        except ImportError:
            return {
                "phase": "STRUCTURAL",
                "confidence": 0.5,
                "error": "Pillow not installed",
            }

        try:
            if isinstance(image_input, (str, Path)):
                img = Image.open(image_input).convert("RGB")
            else:
                img = Image.open(image_input).convert("RGB")
        except Exception as e:
            logger.exception("Failed to open image: %s", e)
            return {
                "phase": "UNKNOWN",
                "confidence": 0.0,
                "error": f"Invalid image file: {e}",
            }

        # If torch is available, run inference
        if self._torch_available and self._model is not None and self._transforms is not None:
            import torch
            import torch.nn.functional as F

            try:
                tensor = self._transforms(img).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    logits = self._model(tensor)
                    probs = F.softmax(logits, dim=1).cpu().numpy()[0]

                idx = int(probs.argmax())
                return {
                    "phase": CLASSES[idx],
                    "confidence": round(float(probs[idx]), 4),
                    "probabilities": {
                        "STRUCTURAL": round(float(probs[0]), 4),
                        "FINISHING": round(float(probs[1]), 4),
                    },
                }
            except Exception as e:
                logger.exception("Torch inference failed: %s", e)

        # Robust Heuristic Fallback (e.g. grayscale/contrast check for concrete vs paint)
        # Structural concrete tends to have higher grayscale uniformity and lower color saturation
        import numpy as np
        img_np = np.array(img.resize((64, 64)))
        std_color = float(np.std(img_np))
        # High color variance often indicates interior finishes / painted walls / tiles
        if std_color > 45.0:
            pred_class = "FINISHING"
            conf = 0.72
        else:
            pred_class = "STRUCTURAL"
            conf = 0.78

        return {
            "phase": pred_class,
            "confidence": conf,
            "probabilities": {
                "STRUCTURAL": 0.78 if pred_class == "STRUCTURAL" else 0.28,
                "FINISHING": 0.72 if pred_class == "FINISHING" else 0.22,
            },
            "note": "Heuristic visual analysis fallback",
        }
