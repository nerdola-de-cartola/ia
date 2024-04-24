import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import csv
import sys

matplotlib.use("Agg")

if len(sys.argv) != 2:
    print("Error expected 2 args")
    exit(1)


fig, ax = plt.subplots(subplot_kw={"projection": "3d"})
ax.set_xlabel('X0')
ax.set_ylabel('X1')
ax.set_zlabel('Y')

file_name = sys.argv[1]
file = open(file_name)
reader = csv.reader(file)
next(reader)

X0 = []
X1 = []
Y = []
for row in reader:
    X0.append(float(row[0]))
    X1.append(float(row[1]))
    Y.append(float(row[2]))
file.close()

X0 = np.array(X0)
X1 = np.array(X1)
Y = np.array(Y)

surf = ax.scatter(X0, X1, Y, linewidth=0, antialiased=False)

# If GUI is avaible
# plt.show()

# If GUI is not avaible
plt.savefig('images/data.png')