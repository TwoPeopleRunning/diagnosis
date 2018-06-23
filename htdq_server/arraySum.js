
function merge(array1, array2) {
    len = array1.length
    if (array1 == null) {
        return array2;
    }
    if (array2 == null) {
        return array1;
    }
    if (len != array2.length) {
        return { 'error': 'The length of Array1 and Array2 must be same' }
    }
    result = new Array(len)


    a = [[1, 2], [3, 4], [2, 3], [5, 6], [2, 3], [5, 6], [2, 3], [5, 6], [2, 3], [5, 6]]
    b = [[2, 3], [5, 6], [2, 3], [5, 6], [2, 3], [5, 6], [2, 3], [5, 6], [2, 3], [5, 6]]
    result = merge(a, b)
    console.log(result)