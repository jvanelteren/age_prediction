#%%
from enum import Enum
from typing import Optional, List
from fastapi import FastAPI, Request
from pydantic import BaseModel
import logging
import pickle
import random
from itertools import cycle


class Ages(BaseModel):
    age: List[str] = []
    faceids: List[str] = []

app = FastAPI()

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG) # the log level needs to be set here and not in uvicorn!


#%%
def gen_img_ids():
    img_ids = list(range(len(df)))
    random.shuffle(img_ids)
    return cycle(img_ids)

def next_batch(gen,n):
    return [next(gen) for _ in range(n)]


# opening pickle file
f = open("predictions.pickle","rb")
df = pickle.load(f)

logger.debug(f'number of items in dataset {len(df)}')
img_batch_gen = gen_img_ids()

import database as db
conn = db.open_db('predictions.db')
db.print_db(conn)
logger.debug(f'{db.count_predictions(conn)} items in database')

@app.get("/get_images/") 
async def return_images():
    logger.debug('get images') # this is the way to use the pydantic base model
    n=10

    batch_info_df = df.loc[next_batch(img_batch_gen,4)]

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
async def submit_preds(ages:Ages,request: Request):
    logger.debug('submit preds') # this is the way to use the pydantic base model
    logger.debug(request.client.host) # this is the way to use the pydantic base model
    logger.debug(ages)
    # TODO save ages to database
    for i in range(len(ages.age)):
        db.create_pred(conn, [request.client.host,ages.faceids[i],ages.age[i]])
    db.print_db(conn)


    return {'msg': 'ok'}

#%%


# %%

# %%
# 
# %%
