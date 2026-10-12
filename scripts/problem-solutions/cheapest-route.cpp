#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        long long w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }
    vector<long long> dist(n + 1, -1);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;
    pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, v] = pq.top();
        pq.pop();
        if (dist[v] >= 0) continue;
        dist[v] = d;
        for (auto [w, cost] : adj[v])
            if (dist[w] < 0) pq.push({d + cost, w});
    }
    cout << dist[n] << '\n';
    return 0;
}
