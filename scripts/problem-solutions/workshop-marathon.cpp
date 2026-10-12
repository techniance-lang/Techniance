#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<long long, long long>> talks(n);  // (end, start)
    for (auto &t : talks) cin >> t.second >> t.first;
    sort(talks.begin(), talks.end());
    long long freeAt = -1;
    int count = 0;
    for (auto &t : talks) {
        if (t.second >= freeAt) {
            count++;
            freeAt = t.first;
        }
    }
    cout << count << '\n';
    return 0;
}
