#%%
from enum import Enum
from typing import Optional, List
from fastapi import FastAPI, Request
from pydantic import BaseModel
import logging
import pickle
import random
from itertools import cycle
from fastapi.middleware.cors import CORSMiddleware # this is absolutely essential to get rid of these *** cors errors
from fastapi import FastAPI, File, UploadFile, HTTPException, status
import numpy as np
from PIL import Image
from io import BytesIO
import time
from datetime import datetime
import torchvision
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
    age: List[int] = []
    faceids: List[str] = []
    actual: List[int] = []

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("gunicorn")
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG) # the log level needs to be set here and not in uvicorn!

import os
import app.database as db
from torchvision import transforms
import torch
from torch import nn

class AgeResnet(nn.Module):
    def __init__(self, size='18', feat_extract=False):
        super().__init__()
        resnet = 'torchvision.models.resnet'+size+'(pretrained=True)'
        resnet = eval(resnet)
        modules=list(resnet.children())[:-1]
        self.resnet =nn.Sequential(*modules)

        if feat_extract:
            # with feature extraction we only train the linear layer and keep the resnet parameters fixed 
            for m in self.modules():
                m.requires_grad_(False)

        self.fc = nn.Linear(in_features=512, out_features=1, bias=True)
        nn.init.kaiming_normal_(self.fc.weight)

    def forward(self,x):
        out = self.resnet(x)
        x = torch.flatten(out, 1)
        return self.fc(x)
        
def img_to_reshaped_normalized_tensor(img):
        # makes a tensor, scales range to 0-1 and normalizes to same as imagenet
        normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                    std=[0.229, 0.224, 0.225])
        resize = transforms.Resize((200,200), interpolation=2)
        # print('1',img.shape)
        img = resize(img)
        img = transforms.functional.pil_to_tensor(img)
        # print('2',img.shape)
        img = normalize(img.float()/255)
        print('3',img.shape)
        return img
model = AgeResnet()
model.load_state_dict(torch.load('app/models/model4.3',map_location=torch.device('cpu')))
model.eval()

def gen_img_ids():
    img_ids = list(range(len(df)))
    random.shuffle(img_ids)
    return cycle(img_ids)

def next_batch(gen,n):
    return [next(gen) for _ in range(n)]

if os.name == 'nt':
    f = open("app/models/windows_predictions.pickle","rb")
else:
    f = open("app/models/predictions.pickle","rb")
df = pickle.load(f)
logger.debug(f'number of items in dataset {len(df)}')
img_batch_gen = gen_img_ids()

conn = db.open_db('app/predictions.db')
print('started')

items_db = db.count_predictions(conn)
if not items_db: items_db = 0
mae_human = db.human_mae(conn)
mae_comp = round(df['loss'].mean(),1)
logger.debug(f"{items_db} items in database, mae human {mae_human}, mae_comp {mae_comp}")


def running_mae(mae_batch, mae_db_before, items_db_before, num_items=10):
    items_db_after = items_db_before + num_items
    mae_after = (mae_batch * num_items + mae_db_before * items_db_before)/items_db_after
    return (items_db_after, mae_after)

 


@app.get("/backend/get_images/") 
async def return_images():
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("Current Time =", current_time)

    t0 = time.time()
    # logger.debug('get images') # this is the way to use the pydantic base model
    # n=10

    batch_info_df = df.loc[next_batch(img_batch_gen,10)]

    faces = list(range(1,11)) # this was a placeholder for images, but can be approached locally
    faceids = ['../../'+str(f) for f in batch_info_df['path']]
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
    ip = request.headers['X-Real-IP'] if 'X-Real-IP' in request.headers else 'unknown'
    batch_size = len(ages.age)
    # save ages to database
    if ages.age and ages.faceids:
        for i in range(len(ages.age)):
            db.create_pred(conn, [ip ,ages.faceids[i],ages.age[i],ages.actual[i], abs(int(ages.age[i])-int(ages.actual[i]))])
            print('added',[ip,ages.faceids[i],ages.age[i],ages.actual[i], abs(int(ages.age[i])-int(ages.actual[i]))])
    # db.print_db(conn)

    mae_batch = sum([abs(ages.age[i] - ages.actual[i]) for i in range(batch_size)])/ batch_size
    print(mae_batch)
    global mae_human
    global items_db

    items_db, mae_human = running_mae(mae_batch, mae_human, items_db, num_items=batch_size)
    print(items_db, mae_human, mae_comp)
    logger.debug(f"{items_db} items in database, mae human {mae_human}, mae_comp {mae_comp}")
    # return {'msg':'success'}
    return {'items_db': str(items_db), 
            'mae_human' : str(round(mae_human,1)), 
            'mae_comp' : str(round(mae_comp,1))}


@app.post("/backend/upload/")
async def create_file(file: bytes = File(...)):
    print('jo')
    # 
    try:
        # transforms.functional.pil_to_tensor
        pil_image = ((Image.open(BytesIO(file))))
    except:
        return {"status": 'failed processing image'}
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unable to process file"
        )
    # print(np.array(pil_image).shape)
    img_t = img_to_reshaped_normalized_tensor(pil_image)

    pred = model(img_t[None])
    from pathlib import Path
    path = Path('app/uploads/')
    pil_image.save(path/(str(time.time())+'.png'),"PNG")
    # todo resizing, normalizing and running it through a model and returning the prediction


    return {"status": str(pred.item())}

@app.post("/backend/test/")
async def create_file():
    print('jo')

    return {"file_size": 'success'}





#%%


# %%

# %%
# 
# %%

# %%

# %%
# %%
