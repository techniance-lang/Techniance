#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n), res(n, -1);
    for (auto &x : a) cin >> x;
    vector<int> waiting;  // indices still looking for a higher score, values non-increasing
    for (int i = 0; i < n; i++) {
        while (!waiting.empty() && a[waiting.back()] < a[i]) {
            res[waiting.back()] = a[i];
            waiting.pop_back();
        }
        waiting.push_back(i);
    }
    for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? ' ' : '\n');
    return 0;
}
