from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # 1. Verify customer
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # 2. Check inventory and calculate total
    total_amount = 0.0
    order_items_data = []
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product '{product.name}'")
        
        total_amount += product.price * item.quantity
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price
        })

    # 3. Create Order
    new_order = models.Order(customer_id=order.customer_id, total_amount=total_amount)
    db.add(new_order)
    db.flush() # get new_order.id
    
    # 4. Create OrderItems and reduce stock
    for data in order_items_data:
        product = data["product"]
        # Reduce stock
        product.stock -= data["quantity"]
        
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=data["quantity"],
            unit_price=data["unit_price"]
        )
        db.add(order_item)
        
    db.commit()
    db.refresh(new_order)
    return new_order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Restore stock for deleted order
    for item in db_order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    db.delete(db_order)
    db.commit()
    return {"ok": True}
