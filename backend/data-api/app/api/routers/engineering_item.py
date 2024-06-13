from fastapi import APIRouter, Request

from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem

engineering_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["engineering"],
    dependencies=[],  # Depends(check_auth)]
)


@router.post("", status_code=201, response_model=EngineeringItem)
async def add_engineering_item(request: Request, organization_id: str, body: BaseEngineeringItem) -> EngineeringItem:
    return await request.app.engineering_controller.create(
        organization_id=organization_id, new_engineering_item=body, current_user="test@test.com"
    )


@router.get("/{id}", status_code=200, response_model=EngineeringItem)
async def get_engineering_item(request: Request, organization_id: str, id: int) -> EngineeringItem:
    return await request.app.engineering_controller.get(organization_id=organization_id, id=id)


@router.patch("/{id}", status_code=200, response_model=EngineeringItem)
async def update_engineering_item(
    request: Request, organization_id: str, id: int, body: BaseEngineeringItem
) -> EngineeringItem:
    return await request.app.engineering_controller.update(
        organization_id=organization_id, id=id, updated_engineering_item=body, current_user="test@test.com"
    )


@router.delete("/{id}", status_code=200)
async def delete_engineering_item(request: Request, organization_id: str, id: int):
    return await request.app.engineering_controller.delete(
        organization_id=organization_id, id=id, current_user="test@test.com"
    )
