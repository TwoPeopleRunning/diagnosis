class Gadget
  @CITY = "beijing"

  @name : 0
  @price : 0

  constructor: (_name, _price) ->
  	@name = _name
  	@price = _price

  sell: ->
    "Buy #{@name} with #{@price} in #{Gadget.CITY}"

iphone = new Gadget("iphone", 4999)
ipad = new Gadget("ipad", 3999)

console.log ipad.name #=> "iphone"
console.log ipad.sell() #=> "Buy ipad with 3999 in beijing"
console.log iphone.name #=> "iphone"
console.log iphone.sell() #=> "Buy iphone with 4999 in beijing"

