[app_preview.webm](https://github.com/LemuelPuglisi/gcviz/assets/42694683/82d511c5-636a-4186-8542-12baf0581fec)

<h1 align="center">Welcome to gcviz 🧬</h1>
<p>
</p>

This project apply relevant community detection algorithms to a network of genes interactions. A Flask web application let you visualize the result of the partitioning for each algorithm applied. You can explore and merge communities, as well as analyze their underling genes. Currently supported algorithms: 

| Name                   | Description                                    | modularity | library        |
| ---------------------- | ---------------------------------------------- | ---------- | -------------- |
| Louvain                | Greedy modularity maximization                 | 0.69       | python-louvain |
| FluidC                 | Fluid communities detection                    | 0.63       | networkx       |
| Clauset-Newman-Moore   | Modularity maximization                        | 0.61       | networkx       |
| Node2Vec               | Graph nodes embeddings clustered with kmeans.  | 0.65       | Node2Vec       |
| Kernigan-Lin bisection | Minimize the cut (applyed recursively)         | 0.06       | networkx       |
| Spectral clustering    | Based on specter of the graph laplacian matrix | 0.66       | scikit-learn   |
| Girvan-Newman          | Edge betweenness based                         | 0.04       | networkx       |

## 🐋 Docker 

Quickly start using the web application through docker:

```shell
$ docker build -t gcviz:latest .
$ docker run -p 5000:5000 gcviz:latest
```

Then go to http://localhost:5000 and enjoy the features. 



## Web application setup

Make sure to have `python` >3.8.* installed and `pip`. Build an environment and activate it, then: 

```shell
$ pip install -r requiremenets.txt
```

When all the requirements are satisfied, launch the application: 

```shell
$ python gcviz.py
```

 

 ## Notebook setup

Enter into `comdet` directory and install the requirements: 

```bash
$ pip install -r requiremenets.txt
```

You can open the notebook and restart the algorithms to reproduce the displayed results. Just make sure to have jupyter-notebook installed. 



## References

* [Lemuel Puglisi](https://lemuelpuglisi.github.io/) (Author)

Papers: 

* [Clauset-Newman-Moore](https://arxiv.org/abs/cond-mat/0408187)
* [Girvan-Newmann](https://www.pnas.org/content/99/12/7821)
* [Asynchronous Fluid Communities algorithm](https://arxiv.org/pdf/1703.09307.pdf)
* [Kernighan-Lin bisection](https://ieeexplore.ieee.org/document/6771089)
* [Node2Vec](https://snap.stanford.edu/node2vec/)
* [Louvain](https://arxiv.org/abs/0803.0476)



## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
