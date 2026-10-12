#include <bits/stdc++.h>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<string> g(r);
    for (auto &row : g) cin >> row;
    if (g[0][0] == '#' || g[r - 1][c - 1] == '#') {
        cout << -1 << '\n';
        return 0;
    }
    vector<vector<int>> dist(r, vector<int>(c, -1));
    queue<pair<int, int>> q;
    dist[0][0] = 0;
    q.push({0, 0});
    const int dy[] = {1, -1, 0, 0}, dx[] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [y, x] = q.front();
        q.pop();
        for (int d = 0; d < 4; d++) {
            int ny = y + dy[d], nx = x + dx[d];
            if (ny < 0 || ny >= r || nx < 0 || nx >= c || g[ny][nx] == '#' || dist[ny][nx] >= 0) continue;
            dist[ny][nx] = dist[y][x] + 1;
            q.push({ny, nx});
        }
    }
    cout << dist[r - 1][c - 1] << '\n';
    return 0;
}
