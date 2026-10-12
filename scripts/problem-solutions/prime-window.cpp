#include <bits/stdc++.h>
using namespace std;

int main() {
    long long lo, hi;
    cin >> lo >> hi;
    long long lim = sqrtl((long double)hi);
    while (lim * lim > hi) lim--;
    while ((lim + 1) * (lim + 1) <= hi) lim++;
    vector<bool> composite(lim + 1, false);
    vector<long long> primes;
    for (long long i = 2; i <= lim; i++) {
        if (composite[i]) continue;
        primes.push_back(i);
        for (long long j = i * i; j <= lim; j += i) composite[j] = true;
    }
    vector<bool> crossed(hi - lo + 1, false);
    for (long long p : primes) {
        long long start = max(p * p, (lo + p - 1) / p * p);
        for (long long v = start; v <= hi; v += p) crossed[v - lo] = true;
    }
    long long count = 0;
    for (long long v = lo; v <= hi; v++)
        if (v >= 2 && !crossed[v - lo]) count++;
    cout << count << '\n';
    return 0;
}
