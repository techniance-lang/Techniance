#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> masks(n, 0);
    for (auto &m : masks) {
        int c;
        cin >> c;
        while (c--) {
            int s;
            cin >> s;
            m |= 1 << s;
        }
    }
    int full = (1 << k) - 1;
    vector<int> dist(1 << k, -1);
    dist[0] = 0;
    queue<int> q;
    q.push(0);
    while (!q.empty()) {
        int cur = q.front();
        q.pop();
        for (int m : masks) {
            int next = cur | m;
            if (dist[next] < 0) {
                dist[next] = dist[cur] + 1;
                q.push(next);
            }
        }
    }
    cout << dist[full] << '\n';
    return 0;
}
