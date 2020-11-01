#%%
import torch, torchvision, torch.nn as nn

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

model = AgeResnet()
model.load_state_dict('model37')
#%%
from http.server import HTTPServer, SimpleHTTPRequestHandler

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler):
    # Entrypoint for python server
    server_address = ("0.0.0.0", 8000)
    httpd = server_class(server_address, handler_class)
    print('launching server')
    httpd.serve_forever()


if __name__ == "__main__":
    run()