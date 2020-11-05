#%%
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


#%%

# opening pickle file
import pickle
import random
from itertools import cycle
f = open("predictions.pickle","rb")
df = pickle.load(f)
logger.debug(len(df))

def gen_img_ids():
    img_ids = list(range(len(df)))
    random.shuffle(img_ids)
    return cycle(img_ids)

def next_batch(gen,n):
    return [next(gen) for _ in range(n)]

img_ids_gen = gen_img_ids()


@app.get("/get_images/") 
async def return_images():
    logger.debug('get images') # this is the way to use the pydantic base model
    n=10

    batch_info_df = df.loc[next_batch(img_ids_gen,4)]

    faces = list(range(10)) # this was a placeholder for images, but can be approached locally
    faceids = list(batch_info_df['path'])
    computer = list(batch_info_df['pred'])
    actual = list(batch_info_df['actual'])
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

#%%

# %%
