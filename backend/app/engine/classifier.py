import io
import numpy as np
from PIL import Image, ImageFilter
from typing import List, Tuple
from backend.app.schemas.materials import PhotoClassificationResponse


class SitePhotoClassifier:
    """
    Binary Computer Vision Classifier for Construction Site Progress:
    - STRUCTURAL_STAGE: Foundation, Columns, Beams, Slabs, Reinforcement, Concrete Formwork.
    - FINISHING_STAGE: Plastering, Flooring, Painting, Electrical / Plumbing Fixtures, Windows.

    LOCKED RULE: Simple binary classification, not object detection or YOLO.
    AI modules must not be required for the system to work.
    """

    @classmethod
    def classify_image_bytes(
        cls, image_bytes: bytes, file_name: str = "site_photo.jpg"
    ) -> PhotoClassificationResponse:
        file_size = len(image_bytes)

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Resize for fast, consistent feature calculation
            image_small = image.resize((256, 256))
            gray = image_small.convert("L")

            # 1. Edge Density Analysis (Laplacian filter proxy)
            edges = gray.filter(ImageFilter.FIND_EDGES)
            edge_array = np.array(edges, dtype=np.float32)
            edge_density = float(np.mean(edge_array))  # High for rebar/scaffolding/shuttering

            # 2. Color Distribution & Brightness
            rgb_array = np.array(image_small, dtype=np.float32)
            r, g, b = rgb_array[:, :, 0], rgb_array[:, :, 1], rgb_array[:, :, 2]

            # Saturation / color variance
            color_std = float(np.std([r, g, b]))
            mean_brightness = float(np.mean(rgb_array))

            # Gray/concrete dominance: close R, G, B values
            rg_diff = np.mean(np.abs(r - g))
            gb_diff = np.mean(np.abs(g - b))
            gray_dominance = float(255.0 - (rg_diff + gb_diff))

            # 3. Decision Heuristic
            # Structural: high edge density (rebar grids, scaffolding), raw concrete gray or earth tones
            # Finishing: lower edge density (smooth plaster, tiles), higher brightness, finished paint tones
            structural_score = 0.0
            detected_features: List[str] = []

            if edge_density > 22.0:
                structural_score += 0.50
                detected_features.append(f"High spatial edge density ({edge_density:.1f}): rebar grid / formwork patterns")
            else:
                detected_features.append(f"Low edge variance ({edge_density:.1f}): smooth planar surfaces (plaster/drywall)")

            if gray_dominance > 220.0 and mean_brightness < 160.0:
                structural_score += 0.35
                detected_features.append("Cementitious raw concrete gray spectrum detected")
            else:
                detected_features.append("High light reflectance & uniform surface finishing tones")

            if structural_score >= 0.50:
                predicted = "STRUCTURAL_STAGE"
                label = "Structural Stage (RCC / Earthwork / Masonry Frame)"
                conf = round(min(0.96, 0.65 + structural_score * 0.35), 2)
            else:
                predicted = "FINISHING_STAGE"
                label = "Finishing Stage (Plaster / Flooring / Painting / MEP)"
                conf = round(min(0.95, 0.70 + (0.50 - structural_score) * 0.40), 2)

            return PhotoClassificationResponse(
                predicted_stage=predicted,
                stage_label=label,
                confidence_score=conf,
                detected_features=detected_features,
                file_name=file_name,
                file_size_bytes=file_size,
                human_verified=False,
            )

        except Exception as e:
            # Safe graceful fallback
            return PhotoClassificationResponse(
                predicted_stage="STRUCTURAL_STAGE",
                stage_label="Structural Stage (Fallback Assessment)",
                confidence_score=0.60,
                detected_features=[f"Image decode fallback applied: {str(e)}"],
                file_name=file_name,
                file_size_bytes=file_size,
                human_verified=False,
            )
