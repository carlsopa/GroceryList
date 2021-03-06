var shopping
var listIndex
var dataCategory = ['Other','Beverages', 'Bakery', 'Canned Goods', 'Dairy', 'Baking Goods', 'Frozen Foods', 'Meat', 'Produce', 'Snacks'];
var dataIndex = ['product', 'quantity', 'category'];
var measureCategory = ['Each', 'Lb', 'Oz', 'Fl Oz']
var lst
var catList = []
var cartList = []
var copyNode;
var trigger = false;
var itemIndex;
var list = document.querySelector('#titleList');
var newItemCategoryList;
var editItemCategoryList;
var newItemUnitList;
var editItemUnitList;
var newItemName;
var newItemQuantity;
var newItemUnit;
var foodButton;
var cart;
var requestUrl = '../Data/grocery.json';
var request = new XMLHttpRequest();
request.open('GET', requestUrl);
request.responseType = 'json';
request.send();

request.onload = function () {
    shopping = request.response;
    TitlePopulate();
    newItemCategoryList = document.querySelector("#newItemCategory");
    editItemCategoryList = document.getElementById('editItemCategory');
    newItemUnitList = document.querySelector("#newItemUnit");
    editItemUnitList = document.getElementById('editItemUnit')
    newItemName = document.querySelector("#newItemName");
    newItemQuantity = document.querySelector("#newItemQuantity");
    newItemUnit = document.querySelector("#newItemUnit");
    foodButton = document.querySelector('#foodButton');
    cart = document.querySelector("#cart");

    categoryPopulate();
    addFood();
    getList();
    ModalButtons();
    NavButtons();
    
};
function Handler(e) {
    console.log(e.target.parentNode.parentNode);
    if (e.target.type == 'checkbox') {
        cartToListControl(e.target.parentNode.parentNode)
    } else if (e.target.id == 'editList') {
        console.log(e.target.parentNode.parentNode.getAttribute('index'));
        itemEdit(e);
    } else if (e.target.id == 'deleteList') {
        console.log(e.target.parentNode.parentNode.getAttribute('index'));
        deleteListItem(e);
    }
}

function NavButtons() {
    document.getElementById('addList').addEventListener('click', newList);
    document.getElementById('deleteList').addEventListener('click', deleteList);
    document.getElementById('shareList');
}
function updateList(type,data) {
    var request = new XMLHttpRequest();
    request.open('POST', 'https://68.33.20.153:443/grocery/Grocery2/BackEnd/php/grocerylist2_php.php');
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    console.log(listIndex);
        sendData = [{ 'type': type, 'id': listIndex, 'data': data }];
    sendData = JSON.stringify(sendData);
    request.send(sendData);
    
    request.onload = function () {
        if (request.status === 200) {
            console.log(request.responseText);
        }
    }
}
//take the list titles from the json file and place them in the drop down box
function TitlePopulate() {
    var list = document.querySelector('#titleList');
    list.options.length = 1;
    for (x = 0; x < shopping.length; x++) {
        var option = document.createElement('option');
        option.innerHTML = shopping[x]['title'];
        option.setAttribute('index', x);
        list.appendChild(option);
        
    }
    TitleDesign();
    
}


//create the dropdown box for the user input
function categoryPopulate() {
    for (items in dataCategory) {
        var option = document.createElement('option');
        option.innerHTML = items;
        option.innerHTML = dataCategory[items];
        option.setAttribute('index', items);
        newItemCategoryList.append(option);
    }
    for (items in measureCategory) {
        var option = document.createElement('option');
        option.innerHTML = measureCategory[items];
        option.setAttribute('index', items);
        newItemUnitList.appendChild(option);
    }
    for (items in dataCategory) {
        var option = document.createElement('option');
        option.innerHTML = items;
        option.innerHTML = dataCategory[items];
        option.setAttribute('index', items);
        editItemCategoryList.append(option);
    }
    for (items in measureCategory) {
        var option = document.createElement('option');
        option.innerHTML = measureCategory[items];
        option.setAttribute('index', items);
        editItemUnitList.appendChild(option);
    }
}
//add food from the input to the grocery list
function addFood() {
    foodButton.addEventListener('click', (event) => {
            var foodCategory = dataCategory[newItemCategory.selectedIndex];
            var foundBoolean = false;
        if (listIndex == undefined) {
            alert("please choose a list to add food");
        } else {
            console.log(shopping);
            console.log(listIndex);
            lst = shopping[listIndex].items;
            for (x = 0; x < lst.length; x++) {
                if (lst[x].product == newItemName.value) {
                    lst[x].quantity = parseInt(lst[x].quantity) + parseInt(newItemQuantity.value);
                    foundBoolean = true;
                    console.log(lst[x]);
                    updateList('update', lst);
                    break;
                }
            }

            if (!foundBoolean) {
                console.log(lst);
                lst.push({ product: newItemName.value, quantity: parseInt(newItemQuantity.value), category: foodCategory, unit: newItemUnit.value })
                updateList('newObject', { product: newItemName.value, quantity: parseInt(newItemQuantity.value), category: foodCategory, unit: newItemUnit.value });
            }
            listPopulate(listIndex);
        }
    })
}
//get the correct list from our data set, based on the list choosen from the drop down box
function newList() {
    title = window.prompt("enter a new list name: ");
    if (title != null) {
        updateList('new', title);
        shopping.push({ 'title': title, 'items': [] });
        TitlePopulate();
        index = shopping.length
        //console.log(document.querySelector('#titleList').options[shopping.length]);
        document.querySelector('#titleList').options[index].selected = true;
        listIndex = index-1;
    }
}
function getList() {
    var title
    var list = document.querySelector('#titleList');

    list.addEventListener('change', (event) => {

        title = event.target.selectedIndex;
            listIndex = title - 1;
            listPopulate(listIndex);
        
    })
    
}
function deleteList() {
    var modal = document.getElementById('modal');
    modal.addEventListener('click', ModalClose);
    modal.classList.add('visible');
    document.getElementById('titles').style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
    document.getElementById('list').style.visibility = 'hidden';
    document.getElementById('modalContent').style.visibility='hidden';
}
function deleteTitle() {
    console.log(shopping);
    if (this.checked) {
        title = this.parentNode.nextSibling.firstChild.innerHTML;
        var index = this.parentNode.parentNode.getAttribute('index');
        console.log(index);
        if (window.confirm("Would you like to delete list: "+title+"?")) {
            shopping.splice(index, 1);
            updateList('delete', index);
            ModalClose();
            TitlePopulate();
        }
    }

}
//being supplied a list it gets the individual objects from the list, and itterates over them building up the list display
function listPopulate(index) {
    if (index < 0) {
        window.alert('please select a list from the drop down to continue.');
    } else {
        var list = document.querySelector('#list');
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
        var listContent = shopping[index].items;
        if (listContent.length > 1) {
            listContent.sort((a, b) => (a.category > b.category) ? 1 : -1);
        }
        for (x = 0; x < listContent.length; x++) {
            listDesign(x, listContent[x]['product'], listContent[x]['category'], listContent[x]['quantity'], listContent[x]['unit']);
        }
    }
}
function listControl() {
    if (this.checked) {
        var parentList = this.parentNode.parentNode.parentNode;   
        var activeNode = this.parentNode.parentNode;
        copyNode = activeNode.cloneNode(true);
        copyNode.addEventListener('change', cartControl);
        if (cart.children.length > 0) {
            for (x = 0; x < cart.children.length; x++) {
                if (parseInt(activeNode.getAttribute("index")) < parseInt(cart.children[x].getAttribute("index"))) {
                    cart.insertBefore(copyNode, cart.children[x]);
                    break;
                } else {
                    cart.append(copyNode);
                }                  
            }
        } else {
            cart.append(copyNode);
        }
    }
    parentList.removeChild(activeNode);
}
function cartToListControl(e) {
    if (!this.checked) {
        console.log(this);
        console.log(e);
        if (e != null) {
            activeNode = e;
            copyNode = e.cloneNode(true);
        } else {
            activeNode = this;
            copyNode = this.cloneNode(true);
        }
        copyNode.addEventListener('change', cartControl);
        console.log(cart);
        if (cart.children.length > 0) {
            for (x = 0; x < cart.children.length; x++) {
                if (parseInt(activeNode.getAttribute("index")) < parseInt(cart.children[x].getAttribute("index"))) {
                    cart.insertBefore(copyNode, cart.children[x]);
                    break;
                } else {
                    cart.append(copyNode);
                }
            }
        } else {
            cart.append(copyNode);
        }
    }
    document.querySelector("#list").removeChild(activeNode);
}

function cartControl() {
    if (!this.checked) {
        activeNode = this;
        copyNode = this.cloneNode(true);
        copyNode.classList.remove("found");
        copyNode.addEventListener('change', Handler);
        copyNode.addEventListener('click', Handler);
        var list = document.querySelector("#list");
        if (list.children.length > 0) {
            for (x = 0; x < list.children.length; x++) {
                if (parseInt(activeNode.getAttribute("index")) < parseInt(list.children[x].getAttribute("index"))) {
                    list.insertBefore(copyNode, list.children[x]);
                    break;
                } else {
                    list.append(copyNode);
                }
            }
        }
    } 
    document.querySelector("#cart").removeChild(activeNode);
}

function itemEdit(e) {
    if (e != null) {
        itemIndex = e.target.parentNode.parentNode.getAttribute('index');
    } else {
        itemIndex = this.parentNode.parentNode.getAttribute('index');
    }
    console.log(itemIndex);
    var listIndex = document.querySelector('#titleList').selectedIndex-1;
    var list = shopping[listIndex].items[itemIndex];
    document.getElementById("editItemName").value = list['product'];
    document.getElementById("editItemCategory").value=list['category'];
    document.getElementById("editItemQuantity").value=list['quantity'];
    document.getElementById("editItemUnit").value = list['unit'];
    var modal = document.getElementById('modal');
    modal.classList.add('visible');
    modal.addEventListener('click', ModalClose);
    document.getElementById('modalEditForm').addEventListener('click', e => e.stopPropagation());
    document.body.style.overflow = 'hidden';
    document.getElementById('modalContent').style.visibility = 'visible';
    document.getElementById('list').style.visibility = 'hidden';
    document.getElementById('titles').style.visibility = 'hidden';
}
function ModalButtons() {
    var modalUpdate = document.getElementById('updateEdit');
    modalUpdate.addEventListener('click', updateEditModal);
    
}
function updateEditModal() {
    modalFood = document.getElementById("editItemName").value;
    modalCategory = document.getElementById("editItemCategory").value;
    modalQty = parseInt(document.getElementById("editItemQuantity").value);
    modalQtyLst = document.getElementById("editItemUnit").value;

    for (x = 0; x < document.getElementById('list').children.length; x++) {
        if (document.getElementById('list').children[x].getAttribute('index') == itemIndex) {
            document.getElementById('list').children[x].children[1].children[0].innerHTML = modalFood;
            document.getElementById('list').children[x].children[2].children[1].innerHTML = modalQty;
            document.getElementById('list').children[x].children[2].children[0].innerHTML = modalQtyLst;
            shopping[listIndex].items[itemIndex].product = modalFood;
            shopping[listIndex].items[itemIndex].quantity = modalQty;
            shopping[listIndex].items[itemIndex].category = modalCategory;
            shopping[listIndex].items[itemIndex].unit = modalQtyLst;

            updateList('update', shopping[listIndex].items);
            if (document.getElementById('list').children[x].children[1].children[1].innerHTML != modalCategory) {
                listPopulate(listIndex);
            }
        }
    }
    ModalClose();
}
function ModalClose() {
    console.log(this);
    document.getElementById('modalContent').style.visibility = 'hidden';
    document.getElementById('titles').style.visibility = 'hidden';
    document.getElementById('modal').classList.remove('visible');
    document.getElementById('list').style.visibility = 'visible';
    document.body.style.overflow = 'auto';
}
function deleteListItem(e) {
    if (e != null) {
        itemIndex = e.target.parentNode.parentNode.getAttribute('index');
    } else {
        itemIndex = this.parentNode.parentNode.getAttribute('index');
    }
    shopping[listIndex].items.splice(itemIndex, 1);
    listPopulate(listIndex);
    updateList('deleteItem', itemIndex);
}

function TitleDesign() {
    var list = document.getElementById('titles');
    while (list.firstChild) {
        console.log(list.firstChild);
        list.removeChild(list.firstChild);
    }
    for (x in shopping) {
        title = shopping[x].title;

        var titleItem = document.createElement('div');
        titleItem.setAttribute('class', 'titleItem');
        titleItem.setAttribute('index', x);
        var control = document.createElement('div');
        control.setAttribute('id', 'control');
        var controlSpan = document.createElement('input');
        controlSpan.setAttribute('type', 'checkbox');
        controlSpan.addEventListener('change', deleteTitle);
        var titleObject = document.createElement('div');
        var titleBox = document.createElement('div');
        titleBox.innerHTML = title;
        control.append(controlSpan);
        titleObject.append(titleBox);
        titleItem.append(control, titleObject);
        list.append(titleItem);
    }
}
//the building of the list display
function listDesign(index,item, category, quantity,unit) {
    var categoryCreate = false;
    //top level selector
    var list = document.querySelector('#list');
    //top level for each individual entry
    var listItems = document.createElement('div');
    listItems.setAttribute('class', 'items');
    listItems.setAttribute('index', index);
    //the top level control element

    var control = document.createElement('div');
    control.setAttribute('id', 'control');
    //delete box
    var controlSpan = document.createElement('input');
    controlSpan.setAttribute('type', 'checkbox');
    controlSpan.addEventListener('change', listControl);
    //top level for product box

    var listItem = document.createElement('div');
    listItem.setAttribute('class', 'object');
    var itemName = document.createElement('span');
    itemName.setAttribute('class', 'product');
    itemName.innerHTML = item;
    //element for the category
    var itemQuantity = document.createElement('span');
    itemQuantity.setAttribute('class', 'quantityValue');
     itemQuantity.innerHTML = quantity;
    var itemUnit = document.createElement('span');
    itemUnit.setAttribute('class', 'left quantityType');
    itemUnit.innerHTML = unit;

    var itemControl = document.createElement('div');
    itemControl.classList.add('hiddenColumn');
    var editButton = document.createElement('button');
    editButton.setAttribute('type', 'button');
    editButton.id = 'editList';
    editButton.classList.add('editButton');
    editButton.innerHTML = 'edit';
    editButton.addEventListener('click', itemEdit);
    var deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.id = 'deleteList';
    deleteButton.classList.add('deleteButton');
    deleteButton.innerHTML = 'delete';
    deleteButton.addEventListener('click', deleteListItem);
    itemControl.append(editButton, deleteButton);
    control.appendChild(controlSpan);
    var linebreak = document.createElement('br');
    listItem.append(itemName, linebreak, itemQuantity, itemUnit);

    var itemCategoryText = document.createElement('div');
    var itemCategory = document.createElement('div');
    itemCategory.setAttribute('class', 'categoryHeader');
    var emptyHolder = document.createElement('div');

    if (catList.length > 0) {
        if (category != catList[catList.length - 1]) {
            itemCategoryText.innerHTML = category;
            itemCategory.append(control,itemCategoryText);
            list.append(itemCategory);
            categoryCreate = true;
        }  else {
            listItems.append(control, listItem, itemControl);
            list.append(listItems);
        }
    } else if (catList.length === 0) {
            itemCategoryText.innerHTML = category;
        itemCategory.append(control,itemCategoryText);
            list.append(itemCategory);
            categoryCreate = true;
    }
    //the following code is keeping the category headers from displaying a checkbox for full category control
    if (categoryCreate) {
        listItems.append(control, listItem, itemControl);
            list.append(listItems);
    }
    catList.push(category);
}
