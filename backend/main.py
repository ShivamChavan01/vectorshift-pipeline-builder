import json
from collections import deque

from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: str = Form(...)):
    try:
        data = json.loads(pipeline)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f'Invalid pipeline JSON: {exc}')

    if not isinstance(data, dict) or 'nodes' not in data or 'edges' not in data:
        raise HTTPException(
            status_code=400,
            detail='Pipeline payload must be an object with "nodes" and "edges" arrays',
        )

    nodes = data.get('nodes') or []
    edges = data.get('edges') or []

    if not isinstance(nodes, list) or not isinstance(edges, list):
        raise HTTPException(
            status_code=400,
            detail='"nodes" and "edges" must be arrays',
        )

    # node type counts (frontend stamps data.nodeType on every node)
    node_type_counts = {}
    for node in nodes:
        node_type = node.get('data', {}).get('nodeType') or (node.get('id') or '').split('-')[0]
        node_type_counts[node_type] = node_type_counts.get(node_type, 0) + 1

    is_dag, topo_order = topological_sort(edges)

    return {
        'num_nodes': len(nodes),
        'num_edges': len(edges),
        'is_dag': is_dag,
        'topological_order': topo_order if is_dag else [],
        'node_type_counts': node_type_counts,
    }


def topological_sort(edges):
    """Kahn's algorithm. Returns (is_dag, topological_order).
    Parallel edges (same source -> target) are deduped for the cycle check."""
    adjacency = {}
    in_degree = {}
    seen_pairs = set()

    for edge in edges:
        source = edge.get('source')
        target = edge.get('target')
        if source is None or target is None:
            continue

        pair = (source, target)
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)

        adjacency.setdefault(source, set()).add(target)
        in_degree.setdefault(source, 0)
        in_degree[target] = in_degree.get(target, 0) + 1

    queue = deque(node for node, degree in in_degree.items() if degree == 0)
    topo_order = []

    while queue:
        node = queue.popleft()
        topo_order.append(node)
        for neighbor in adjacency.get(node, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    is_dag = len(topo_order) == len(in_degree)
    return is_dag, topo_order
