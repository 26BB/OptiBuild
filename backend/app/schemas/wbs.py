from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.schedule import TaskItem


class BuildingParametersInput(BaseModel):
    project_name: str = Field(default="Tower-A Residential (G+14)")
    plot_area_sqft: float = Field(default=25000.0, ge=100.0, description="Plot area in sq.ft.")
    built_up_area_sqft: float = Field(default=75000.0, ge=100.0, description="Total construction built-up area")
    carpet_area_sqft: Optional[float] = Field(default=52500.0, ge=0.0)
    number_of_floors: int = Field(default=15, ge=1, le=80, description="Number of above-ground floors (e.g. G+14)")
    number_of_basements: int = Field(default=1, ge=0, le=5)
    construction_type: str = Field(default="RCC_FRAME", description="RCC_FRAME | PRECAST | COMPOSITE")
    base_rate_per_sqft: float = Field(default=2400.0, ge=500.0, description="Approximate construction rate (INR/sqft)")
    target_handover_date: Optional[str] = Field(default="2027-12-15")


class WbsItem(BaseModel):
    wbs_code: str
    title: str
    category: str
    budget_percentage: float
    estimated_cost: float
    duration_days: int
    predecessors: List[str]
    resource_demands: Dict[str, int]


class WbsCategory(BaseModel):
    category_name: str
    total_percentage: float
    total_cost: float
    items: List[WbsItem]


class ParametricWbsResponse(BaseModel):
    project_name: str
    built_up_area_sqft: float
    base_rate_per_sqft: float
    total_estimated_cost: float
    categories: List[WbsCategory]
    generated_tasks: List[TaskItem]
    cpm_makespan_days: int
