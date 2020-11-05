from enum import Enum
from typing import Optional, List
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.logger import logger
from uvicorn.config import LOGGING_CONFIG
import logging

class Item(BaseModel):
    user: str
    pwd: Optional[str] = None
    organization: str
    required: Optional[str] = None

class Ages(BaseModel):
    age: List[str] = []
    faceids: List[str] = []

class User(BaseModel):
    user: str

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"
    
app = FastAPI()

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)
logger.debug("Debug test") # the log level needs to be set here and not in uvicorn!


@app.get("/get_images/") #use post since server receives
async def return_images():
    logger.debug('get images') # this is the way to use the pydantic base model
    faces = list(range(10))
    faceids = list(range(20,30))
    computer = list(range(30,40))
    actual = list(range(50,60))
    return {'faces': faces, 
            'faceids': faceids,
            'computer': computer,
            'actual': actual
            }

@app.post("/submit_preds/") #use post since server receives
async def submit_preds(ages:Ages):
    logger.debug('submit preds') # this is the way to use the pydantic base model
    logger.debug(ages)
    # TODO save ages to database
    return {'msg': 'ok'}

import uvicorn

# def run():
#     # LOGGING_CONFIG["formatters"]["default"]["fmt"] = "%(asctime)s [%(name)s] %(levelprefix)s %(message)s"
#     uvicorn.run(app, host="127.0.0.1", port=8000, log_level='debug')


# if __name__ == "__main__":
#     run()