#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n < 2) {
        cout << 0 << '\n';
        return 0;
    }
    vector<bool> composite(n + 1, false);
    int count = 0;
    for (long long i = 2; i <= n; i++) {
        if (composite[i]) continue;
        count++;
        for (long long j = i * i; j <= n; j += i) composite[j] = true;
    }
    cout << count << '\n';
    return 0;
}
