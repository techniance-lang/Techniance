#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<long long, string>> people(n);  // (-xp, name) sorts into league order
    for (auto &p : people) {
        long long xp;
        cin >> p.second >> xp;
        p.first = -xp;
    }
    sort(people.begin(), people.end());
    for (int i = 0; i < n; i++) cout << i + 1 << ". " << people[i].second << ' ' << -people[i].first << '\n';
    return 0;
}
