#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long l = 1;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        l = l / __gcd(l, x) * x;  // divide first so the intermediate value never overflows
    }
    cout << l << '\n';
    return 0;
}
