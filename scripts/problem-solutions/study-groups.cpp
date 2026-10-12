#include <bits/stdc++.h>
using namespace std;

vector<int> parent, sz;

int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    parent.resize(n + 1);
    sz.assign(n + 1, 1);
    iota(parent.begin(), parent.end(), 0);
    int groups = n;
    while (q--) {
        char op;
        int a, b;
        cin >> op >> a >> b;
        int ra = find(a), rb = find(b);
        if (op == '+') {
            if (ra == rb) continue;
            if (sz[ra] < sz[rb]) swap(ra, rb);
            parent[rb] = ra;
            sz[ra] += sz[rb];
            groups--;
        } else {
            cout << (ra == rb ? "YES" : "NO") << '\n';
        }
    }
    cout << groups << '\n';
    return 0;
}
