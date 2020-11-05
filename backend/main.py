from enum import Enum
from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.logger import logger
from uvicorn.config import LOGGING_CONFIG

class Item(BaseModel):
    user: str
    pwd: Optional[str] = None
    organization: str
    required: Optional[str] = None


class User(BaseModel):
    user: str

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"
import logging
app = FastAPI()

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)
logger.debug("Debug test") # the log level needs to be set here and not in uvicorn!


@app.get("/submit_preds/")
async def submit_preds(item: Item):
    print(item)
    print (1+1)

@app.get("/model/{model_name}")
async def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}

@app.post("/get_images/") #use post since server receives
async def return_images(item:Item):
    logger.debug("get images debug")
    logger.debug(item)
    logger.debug(item.pwd) # this is the way to use the pydantic base model

    return {'msg':'success'}
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}

import uvicorn

# def run():
#     # LOGGING_CONFIG["formatters"]["default"]["fmt"] = "%(asctime)s [%(name)s] %(levelprefix)s %(message)s"
#     uvicorn.run(app, host="127.0.0.1", port=8000, log_level='debug')


# if __name__ == "__main__":
#     run()