#include <bits/stdc++.h>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<string> g(r);
    for (auto &row : g) cin >> row;
    string cmds;
    cin >> cmds;
    const int dr[] = {-1, 0, 1, 0}, dc[] = {0, 1, 0, -1};
    const string names = "NESW";
    int y = 0, x = 0, d = 1;
    vector<vector<bool>> seen(r, vector<bool>(c, false));
    seen[0][0] = true;
    int visited = 1;
    for (char ch : cmds) {
        if (ch == 'L') d = (d + 3) % 4;
        else if (ch == 'R') d = (d + 1) % 4;
        else {
            int ny = y + dr[d], nx = x + dc[d];
            if (ny < 0 || ny >= r || nx < 0 || nx >= c || g[ny][nx] == '#') continue;
            y = ny, x = nx;
            if (!seen[y][x]) seen[y][x] = true, visited++;
        }
    }
    cout << y + 1 << ' ' << x + 1 << ' ' << names[d] << '\n' << visited << '\n';
    return 0;
}
