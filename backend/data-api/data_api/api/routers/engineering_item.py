from fastapi import APIRouter, Request

from data_api.orm.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem

engineering_item_router = APIRouter

router = APIRouter(
    prefix="/engineeringItem",
    tags=["engineeringItem"],
    dependencies=[],  # Depends(check_auth)]
)


@router.post("/", status_code=201, response_model=EngineeringItem)
async def add_engineering_item(request: Request, body: BaseEngineeringItem):
    pass
