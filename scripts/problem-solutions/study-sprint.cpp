#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long s;
    cin >> n >> s;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int best = n + 1, left = 0;
    long long total = 0;
    for (int right = 0; right < n; right++) {
        total += a[right];
        while (total >= s) {
            best = min(best, right - left + 1);
            total -= a[left++];
        }
    }
    cout << (best <= n ? best : 0) << '\n';
    return 0;
}
