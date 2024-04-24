import numpy as np  
import matplotlib
import matplotlib.pyplot as plt
import random
import json
import sys

matplotlib.use("Agg")

class Linear:
    def __init__(self, W, b):
        self.W = W
        self.b = b

    def calc(self, x):
        y = self.b

        if len(x) != len(self.W):
            exit(1)

        for i in range(len(x)):
            y += x[i]*self.W[i]

        return y

if len(sys.argv) != 2:
    print("Error expected 2 args")
    exit(1)

file_name = sys.argv[1]
file = open(file_name)
data = json.load(file)
file.close()

model = Linear(data['W'], data['b'])


def fun(X0, X1):
    Y = []

    for i in range(len(X0)):
        x = [X0[i], X1[i]]
        Y.append(model.calc(x))

    return Y

fig, ax = plt.subplots(subplot_kw={"projection": "3d"})
X0 = X1 = np.arange(-5, 5, 0.05)
X0, X1 = np.meshgrid(X0, X1)
Y = fun(np.ravel(X0), np.ravel(X1))
Y = np.array(Y)
Y = Y.reshape(X0.shape)

ax.plot_surface(X0, X1, Y)

ax.set_xlabel('X0')
ax.set_ylabel('X1')
ax.set_zlabel('Y')

# If GUI is avaible
# plt.show()

# If GUI is not avaible
plt.savefig('images/model.png')