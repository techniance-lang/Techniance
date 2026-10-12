#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long k;
    cin >> n >> k;
    unordered_map<long long, long long> seen;
    long long total = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        auto it = seen.find(k - x);
        if (it != seen.end()) total += it->second;
        seen[x]++;
    }
    cout << total << '\n';
    return 0;
}
