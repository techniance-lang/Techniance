#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<long long> values;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        values.insert(x);
    }
    if (values.size() < 2) cout << -1 << '\n';
    else cout << *next(values.rbegin()) << '\n';
    return 0;
}
