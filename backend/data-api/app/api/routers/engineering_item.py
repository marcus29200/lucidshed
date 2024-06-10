from fastapi import APIRouter, Request

from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem

engineering_item_router = APIRouter

router = APIRouter(
    prefix="/engineeringItem",
    tags=["engineeringItem"],
    dependencies=[],  # Depends(check_auth)]
)


@router.post("", status_code=201, response_model=EngineeringItem)
async def add_engineering_item(request: Request, body: BaseEngineeringItem) -> EngineeringItem:
    return await request.app.engineering_controller.create(
        new_engineering_item=body, current_user="test@test.com"
    )  # TODO Need to get org id from headers


@router.get("/{id}", status_code=200, response_model=EngineeringItem)
async def get_engineering_item(request: Request, id: int) -> EngineeringItem:
    return await request.app.engineering_controller.get(
        organization_id="test", id=id
    )  # TODO Need to get org id from headers


@router.patch("/{id}", status_code=200, response_model=EngineeringItem)
async def update_engineering_item(request: Request, id: int, body: BaseEngineeringItem) -> EngineeringItem:
    return await request.app.engineering_controller.update(
        organization_id="test",
        id=id,
        updated_engineering_item=body,  # TODO Need to get org id from headers
    )


@router.delete("/{id}", status_code=200)
async def delete_engineering_item(request: Request, id: int):
    return await request.app.engineering_controller.delete(
        organization_id="test",
        id=id,
        current_user="test@test.com",  # TODO Need to get org id and current user from headers
    )
