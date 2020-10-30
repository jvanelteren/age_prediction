From python:3.9

ENV SRC_DIR /usr/bin/ds

COPY src/* ${SRC_DIR}/

WORKDIR ${SRC_DIR}

ENV PYTHONUNBUFFERED=1

CMD ["python", "server.py"]

