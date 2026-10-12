#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        indeg[b]++;
    }
    priority_queue<int, vector<int>, greater<int>> ready;
    for (int v = 1; v <= n; v++)
        if (indeg[v] == 0) ready.push(v);
    vector<int> order;
    while (!ready.empty()) {
        int v = ready.top();
        ready.pop();
        order.push_back(v);
        for (int w : adj[v])
            if (--indeg[w] == 0) ready.push(w);
    }
    if ((int)order.size() != n) {
        cout << "IMPOSSIBLE\n";
        return 0;
    }
    for (int i = 0; i < n; i++) cout << order[i] << (i + 1 < n ? ' ' : '\n');
    return 0;
}
