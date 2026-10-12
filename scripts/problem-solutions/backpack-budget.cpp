#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, cap;
    cin >> n >> cap;
    vector<long long> best(cap + 1, 0);  // best[c] = top usefulness within capacity c
    for (int i = 0; i < n; i++) {
        int w;
        long long v;
        cin >> w >> v;
        for (int c = cap; c >= w; c--) best[c] = max(best[c], best[c - w] + v);  // downwards: each gadget once
    }
    cout << best[cap] << '\n';
    return 0;
}
