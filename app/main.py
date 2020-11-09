#%%
from enum import Enum
from typing import Optional, List
from fastapi import FastAPI, Request
from pydantic import BaseModel
import logging
import pickle5
import random
from itertools import cycle
from fastapi.middleware.cors import CORSMiddleware # this is absolutely essential to get rid of these *** cors errors
from fastapi import FastAPI, File, UploadFile, HTTPException, status
import numpy as np
from PIL import Image
from io import BytesIO
# you can specify allowed origins, or just allow everything with ["*"]
origins = [
    "http://34.121.58.11/",
    "http://34.121.58.11",
    "http://localhost",
    "http://localhost:8080",
]

import os
if os.getcwd()=='/ds/app':
    os.chdir('/ds')
class Ages(BaseModel):
    age: List[str] = []
    faceids: List[str] = []

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("uvicorn")
logger = logging.getLogger("gunicorn")
logger.setLevel(logging.DEBUG) # the log level needs to be set here and not in uvicorn!


#%%
def gen_img_ids():
    img_ids = list(range(len(df)))
    random.shuffle(img_ids)
    return cycle(img_ids)

def next_batch(gen,n):
    return [next(gen) for _ in range(n)]


# opening pickle file
f = open("app/models/predictions.pickle","rb")
df = pickle5.load(f)

logger.debug(f'number of items in dataset {len(df)}')
img_batch_gen = gen_img_ids()

import app.database as db
conn = db.open_db('app/predictions.db')
# db.print_db(conn)
print('started')
logger.debug(f'{db.count_predictions(conn)} items in database')
import time
from datetime import datetime



@app.get("/backend/get_images/") 
async def return_images():
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("Current Time =", current_time)

    t0 = time.time()
    # logger.debug('get images') # this is the way to use the pydantic base model
    # n=10

    batch_info_df = df.loc[next_batch(img_batch_gen,4)]

    faces = list(range(10)) # this was a placeholder for images, but can be approached locally
    faceids = ['../../'+f for f in batch_info_df['path']]
    computer = list(batch_info_df['pred'])
    actual = list(batch_info_df['actual'])
    print(time.time()-t0)
    # print(faces, faceids, computer, actual)
    # return {'hi':'33'}
    return {'faces': faces, 
            'faceids': faceids,
            'computer': computer,
            'actual': actual
            }

@app.post("/backend/submit_preds/") #use post since server receives
async def submit_preds(ages:Ages,request: Request):
    logger.debug('submit preds') # this is the way to use the pydantic base model
    logger.debug(request.client.host) # this is the way to use the pydantic base model
    logger.debug(ages)
    print(ages)
    # save ages to database
    if ages.age and ages.faceids:
        for i in range(len(ages.age)):
            db.create_pred(conn, [request.client.host,ages.faceids[i],ages.age[i]])
            print('added')
    # db.print_db(conn)


    return {'msg': 'ok'}




@app.post("/backend/upload/")
async def create_file(file: bytes = File(...)):
    print('jo')
    # 
    try:
        pil_image = np.array(Image.open(BytesIO(file)))

    except:
        return {"file_size": '2'}
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unable to process file"
        )
    print(np.array(pil_image).shape)

    return {"file_size": '4'}

@app.post("/backend/test/")
async def create_file():
    print('jo')

    return {"file_size": 'success'}
#%%


# %%

# %%
# 
# %%
