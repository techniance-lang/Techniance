#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, d;
    cin >> n >> d;
    vector<long long> p(n);
    for (auto &x : p) cin >> x;
    auto daysNeeded = [&](long long limit) {
        int days = 1;
        long long today = 0;
        for (long long x : p) {
            if (today + x > limit) days++, today = x;
            else today += x;
        }
        return days;
    };
    long long lo = *max_element(p.begin(), p.end()), hi = accumulate(p.begin(), p.end(), 0LL);
    while (lo < hi) {
        long long mid = (lo + hi) / 2;
        if (daysNeeded(mid) <= d) hi = mid;
        else lo = mid + 1;
    }
    cout << lo << '\n';
    return 0;
}
