#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int r, c;
    cin >> r >> c;
    vector<vector<long long>> P(r + 1, vector<long long>(c + 1, 0));
    for (int i = 1; i <= r; i++) {
        string row;
        cin >> row;
        for (int j = 1; j <= c; j++) P[i][j] = (row[j - 1] - '0') + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
    }
    int q;
    cin >> q;
    while (q--) {
        int r1, c1, r2, c2;
        cin >> r1 >> c1 >> r2 >> c2;
        cout << P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1] << '\n';
    }
    return 0;
}
