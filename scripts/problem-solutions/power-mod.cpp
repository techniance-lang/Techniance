#include <bits/stdc++.h>
using namespace std;

long long power(long long a, long long b, long long m) {
    long long result = 1 % m;
    a %= m;
    while (b > 0) {
        if (b & 1) result = result * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return result;
}

int main() {
    int t;
    cin >> t;
    while (t--) {
        long long a, b, m;
        cin >> a >> b >> m;
        cout << power(a, b, m) << '\n';
    }
    return 0;
}
