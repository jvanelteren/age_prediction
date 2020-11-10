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
    actual: List[str] = []

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
import os

if os.name == 'nt':
    f = open("app/models/windows_predictions.pickle","rb")
else:
    f = open("app/models/predictions.pickle","rb")
df = pickle.load(f)

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
    print('this is the host', request.headers['X-Real-IP'])
    # save ages to database
    if ages.age and ages.faceids:
        for i in range(len(ages.age)):
            db.create_pred(conn, [request.headers['X-Real-IP'],ages.faceids[i],ages.age[i],ages.actual[i], abs(int(ages.age[i])-int(ages.actual[i]))])
            print('added',[request.headers['X-Real-IP'].host,ages.faceids[i],ages.age[i],ages.actual[i], abs(int(ages.age[i])-int(ages.actual[i]))])
    # db.print_db(conn)


    return {'msg': 'ok'}

import torchvision
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
        print('1',img.shape)
        img = resize(img/255)
        print('2',img.shape)
        img = normalize(img)
        print('3',img.shape)
        return img
model = AgeResnet()
model.load_state_dict(torch.load('app/models/model4.3',map_location=torch.device('cpu')))
model.eval()

@app.post("/backend/upload/")
async def create_file(file: bytes = File(...)):
    print('jo')
    # 
    try:
        pil_image = transforms.functional.pil_to_tensor((Image.open(BytesIO(file))))
    except:
        return {"status": 'failed processing image'}
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unable to process file"
        )
    print(np.array(pil_image).shape)
    img_t = img_to_reshaped_normalized_tensor(pil_image)

    pred = model(img_t[None])
    
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
