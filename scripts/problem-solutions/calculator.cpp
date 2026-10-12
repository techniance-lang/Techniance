#include <bits/stdc++.h>
using namespace std;

// Shunting-yard: two stacks, apply operators of higher or equal precedence before pushing a new one.
int prec(char op) { return op == '*' ? 2 : 1; }

void apply(vector<long long> &nums, vector<char> &ops) {
    char op = ops.back();
    ops.pop_back();
    long long b = nums.back();
    nums.pop_back();
    long long a = nums.back();
    nums.pop_back();
    nums.push_back(op == '+' ? a + b : op == '-' ? a - b : a * b);
}

long long evaluate(const string &e) {
    vector<long long> nums;
    vector<char> ops;
    for (size_t i = 0; i < e.size(); i++) {
        char ch = e[i];
        if (ch == ' ') continue;
        if (isdigit((unsigned char)ch)) {
            long long v = 0;
            while (i < e.size() && isdigit((unsigned char)e[i])) v = v * 10 + (e[i++] - '0');
            i--;
            nums.push_back(v);
        } else if (ch == '(') {
            ops.push_back(ch);
        } else if (ch == ')') {
            while (ops.back() != '(') apply(nums, ops);
            ops.pop_back();
        } else {
            while (!ops.empty() && ops.back() != '(' && prec(ops.back()) >= prec(ch)) apply(nums, ops);
            ops.push_back(ch);
        }
    }
    while (!ops.empty()) apply(nums, ops);
    return nums.back();
}

int main() {
    int t;
    cin >> t;
    string line;
    getline(cin, line);
    while (t--) {
        getline(cin, line);
        cout << evaluate(line) << '\n';
    }
    return 0;
}
