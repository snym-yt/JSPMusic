## 目的
[Go言語でつくるインタプリタ](https://www.oreilly.co.jp/books/9784873118222/)で作成されているインタプリタをJavaScriptで実装してみること．


## 実行方法

(1)`/JSPMusic`に移動

(2)`node JSparser_test.js`を実行



### 構文

##### (1)変数束縛

`var x = 0;`

初期化だけでなく，代入の際にも`var`の文言が必要となっている．

JavaScriptの`var`を参照したが，PMusicでは宣言と代入の区別はない．
スコープは[関数スコープ](https://www.codegrid.net/articles/2017-js-scope-1/)

```
>> var x =12;
>> var x = "a";
>> x
a
>> x + 1;
Woops! Executing bytecode failed:
  unsupported types for binary operation: STRING INTEGER
>> x = "c";
no prefix parse function for = found
```

```
var x = 0;
while(x<3){ play(56+x, 0.5); var x=x+1; var y = 1; }
y + 1;

>> 2  // whileのブロックで宣言してもブロック外で使える
```

JavaScriptのvarについて: https://techplay.jp/column/1619
ただし, JavaScriptのものと完全に一致はしていない

*VSCodeのプレビューでindex.htmlを開くと，変数ブロックの作成ができないことに注意．

##### (2)return文

`return 10;`

##### (3)繰り返し

`while(x<3){ play(56+x, 0.5); var x=x+1; }`

`loop(3){ play(56, 0.5); }`

次のように入れ子構造にすることも可能．
（ここでは分かりやすくするために改行しているが，この書き方ではエラーが生じる．詳しくは下記に示す継続行の説明へ．）
```
loop(3){
  play(62, 0.3);
  loop(2){
    play(56, 0.2); play(68, 0.1);
  }
}
```
loop文は本文を書くところに変数束縛を使用するとエラーが発生して終了してしまっていることに注意．

また．本リポジトリでビジュアルプログラミング化する際にBlocklyに元から組み込まれているものを流用するため，"loop"は"repeat"として表されている．

##### (4)条件分岐

```
if( 3*5 > 10){
  return "OK";
} else{
  return "NG";
}
```
```
OK
```

##### (5)関数定義

インタプリタ版ではimplicit returnだけだが，コンパイラ版ではexplicit return もカバーする．

次の二つの関数はコンパイラによって同じバイトコードを出力する．

```
fn(){ 5 + 10; }         //implicit return
fn(){ return 5 + 10; }  //explicit return
```

```
var add = fn(a, b, c){ return a + b + c;};` 
add(1, 2, 3);
```
```
6
```

インタプリタ版では以下の二つのようなものは扱えないが，コンパイラ版では`Null`を返すようにしている．

本文が空
```
fn(){ };
```
本文が変数束縛のみ
```
fn(){ var a = 1; };
```


###### 再帰

```
var countDown = fn(x){
  if (x == 0){
    return 0;
  }else {
    countDown(x-1);
  }
};
countDown(1);
```
```
0
```

##### (6)配列

配列の要素は型が一致していなくてもよい．

```
var Array = ["Name", 12, fn(x){ x * x }];
Array[2](2);  //　4
```

[Blocklyの配列のWiki](https://github.com/google/blockly/wiki/Lists)
「create empty list」，「create list with」，「length of」のみ実装．

##### (7)ハッシュ

```
var hash = {"one": 1, "two": 10-8, "three": 15/5};
hash["three"];  // 3

var people = [ {"name": "Sonoyama", "age": 22}, {"name": "Saeki", "age": 28} ];
people[1]["name"];  // Saeki
people[0]["age"] + people[1]["age"];  // 50

var getName = fn(person){
  person["name"];
};
getName(people[0]);  //Sonoyama
getName(people[1]);  //Saeki
```

##### 継続行：改行文字「\」
PMusicはインタプリタであるため，基本は1行で命令を完結させる．
しかし，これではif文やwhile文などは命令が長くなってしまい，可読性も低くなる．
そのため，命令を継続できる改行文字として「\」を採用し，複数行にまたがる入力を可能にしている．

文末に「\」を用いることで継続行にすることができる．
継続行となっているときは「..」と表示される．

```
>> var aa = 0;
>> aa;\
.. aa+1;
1
>> var aa = 2;
>> aa;
2
>> 
>> loop(3){\
..   play(62, 0.3);\
..   loop(2){\
..     play(56+aa, 0.2); play(68, 0.1);\
..   }\
.. }
res: 68
res: 68
res: 68
res: 68
68
```




### 組み込み関数(確率音楽)：確率音楽関数

##### (1)gauss

引数にとったパラメータから[ガウス分布](https://ja.wikipedia.org/wiki/%E6%AD%A3%E8%A6%8F%E5%88%86%E5%B8%83)を作成し，そのガウス分布からランダムに音を生成する．

`gauss(”欲しい音の数”[int], ”ノートナンバー平均値”[int], ”分散”[float]);`

`gauss(5, 60, 0.89);`

##### (2)weibul

引数に取ったパラメータから[ワイブル分布](https://poncotty.com/2020/03/28/%E3%83%AF%E3%82%A4%E3%83%96%E3%83%AB%E5%88%86%E5%B8%83/)を作成し，そのワイブル分布からランダムに音を生成する．他の確率音楽関数と違って，一度に生成できる音の数は１のみ．引数が4つは多いと判断したため．

`weibul(”形状”[float], ”尺度”[int], ”位置”[int: 1...5]);`

`weibul(2.4, 70, 2);`

位置パラメータの値を1~5に制限しているのは，weibul関数の知識がない人が位置パラメータの値を大きく取り過ぎてノートナンバーが以上に高くなるのを防ぐため．

##### (3)randwalk

ガウス分布から音高の変化値を抽出し，現在の音高に加えていく．

`randwalk(”欲しい音の数”[int], ”開始ノートNo.”[int]);`

`randwalk(13, 67);`

### 組み込み関数(音生成)

##### (1)play

`play("MIDIノートナンバー[int], "音長"[float]);`

`play(60, 0.5);`

### 組み込み関数(その他)

##### (1)len

文字列の長さや配列の大きさを返す．

```
>> var string = "Hello";
>> var array = [1, 2, 3];
>> len(string);
5
>> len(array);
3
```

##### (2)first

配列の先頭の要素を取得する．

```
>> var array = [1, 2];
>> first(array);
1
```

##### (3)last

配列の最後尾の要素を取得する．

```
>> var array = [1, 2, 3];
>> last(array);
3
```

##### (4)rest

与えられた配列の最初の要素を取り除いた配列を返す．
返しているのは新しく作成した残り要素の配列なので，引数に渡された配列自体は変化していない．

```
>> var array = [1, 2, 3];
>> rest(array);
[2, 3]
>> rest(rest(array));
[3]
>> rest(rest(rest(array)));
[]
>> rest(rest(rest(rest(array))));
null
```


##### (5)push

配列の最後尾に新しい要素を追加する．
この組み込み関数においても，返してるのは新しく作成した配列なので，引数に渡された配列自体は変化していない．

PMusicにおいて配列は不変としている．

`push("配列", "加える要素");`

```
>> var array1 = [1];
>> var array2 = push(array, 2);
>> array1;
[1]
>> array2;
[1, 2]
```

##### (6)puts

与えられた引数を改行つきで標準出力する．
引数の個数は可変であり，それぞれを別の行に表示する．
標準出力を行うだけで値は生成しない．

```
puts("Hello", "World!");
var putsReturnValue = puts("foobar");
putsReturnValue
```
```
Hello
World!
foobar
null
```


### 型付け

動的型付け

### データ型
- int型
- float型
- string型
- boolean型
- リスト型(配列)
- ハッシュ型

