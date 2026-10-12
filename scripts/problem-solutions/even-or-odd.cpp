#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        long long n;
        cin >> n;
        // n % 2 is -1 for negative odd numbers in C++, so compare with 0.
        cout << (n % 2 == 0 ? "EVEN" : "ODD") << '\n';
    }
    return 0;
}
