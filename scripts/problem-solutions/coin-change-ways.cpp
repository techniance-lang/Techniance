#include <bits/stdc++.h>
using namespace std;

int main() {
    const long long MOD = 1000000007;
    int n, t;
    cin >> n >> t;
    vector<long long> ways(t + 1, 0);
    ways[0] = 1;
    for (int i = 0; i < n; i++) {
        int c;
        cin >> c;
        for (int v = c; v <= t; v++) ways[v] = (ways[v] + ways[v - c]) % MOD;
    }
    cout << ways[t] << '\n';
    return 0;
}
