#include <bits/stdc++.h>
using namespace std;

int main() {
    const long long MOD = 1000000007;
    int r, c;
    cin >> r >> c;
    vector<string> g(r);
    for (auto &row : g) cin >> row;
    vector<long long> dp(c, 0);  // dp[j] = paths to (current row, j)
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (g[i][j] == '#') dp[j] = 0;
            else if (i == 0 && j == 0) dp[j] = 1;
            else if (j > 0) dp[j] = (dp[j] + dp[j - 1]) % MOD;
        }
    }
    cout << dp[c - 1] << '\n';
    return 0;
}
