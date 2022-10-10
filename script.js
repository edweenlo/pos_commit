var isDataConverted = false

function onDataParseHandler() {
  try {
    const dataInput = document.getElementById("json-data-input");
    const dataOutput = document.getElementById("data-output");

    const orders = JSON.parse(dataInput.value);

    let currentOrder = orders[0].batch;

    let groupByOrderId = {};

    let index = 0;
    let nextOrder = 0;


    while (index < orders.length) {
      if (currentOrder === orders[index].batch) {
        if (!groupByOrderId[nextOrder + "-" + currentOrder]) {
          groupByOrderId[nextOrder + "-" + currentOrder] = [orders[index]];
        } else {
          groupByOrderId[nextOrder + "-" + currentOrder].push(orders[index]);
        }

        index++;
      } else {
        currentOrder = orders[index].batch;
        nextOrder++;
      }
    }

    let modifiedOrders = [];
    let cachedItems = {};
    
    Object.keys(groupByOrderId).forEach((orderId) => {
      let orders = groupByOrderId[orderId];

      // if wo1 and wo2 are missing consider them completed
      let woOneComplete = orders.some((order) => {
        return order.workordernum !== 'Work Order 1';
        
      });
      let woTwoComplete = orders.some((order) => {
        return order.workordernum !== 'Work Order 2';
      });

      // if wo1 or wo2 have enough available to meet qtyconversion demand...
      let woOneEnoughAvailable = orders.every((order) => {
        if (order.workordernum === 'Work Order 1') {
          return order.available > order.qtyconversion;
        }
      });
      let woTwoEnoughAvailable = orders.every((order) => {
        if (order.workordernum === 'Work Order 2') {
          return order.available > order.qtyconversion;
        }
      });

      orders.forEach((order) => {
        if (woOneComplete || woOneEnoughAvailable) {
          order.woOneFulfillable = true;
        } 
        if (woTwoComplete || woTwoEnoughAvailable) {
          order.woTwoFulfillable = true;
        } 
      });


    });




    Object.keys(groupByOrderId).forEach((orderId) => {
      let orders = groupByOrderId[orderId];
      
      let temp = [...orders];

      let canFulfil = true;


      temp.forEach((order) => {
        if (order.woOneFulfillable && order.inventorytype === 'Work In Process') {
          order.available += order.qtyconversion;
          order.qtyAdded = true;
        }
        if (order.woTwoFulfillable && order.inventorytype === 'Finished Goods') {
          order.available += order.qtyconversion;
          order.qtyAdded = true;
        }


        if (
          order.available === "NULL" ||
          Number(order.qtyconversion) > Number(order.available)
        ) {
          canFulfil = false;
          order.status = "red";
        }
      });

   
      temp.forEach((order) => {
        if (!order.status) {
          order.status = canFulfil ? "green" : "none";
        }
        modifiedOrders.push(order);
      });
      
      
      if (canFulfil) {
        temp.forEach((order) => {
          if (!cachedItems[order.item]) {
            cachedItems[order.item] =
              Number(order.available) - Number(order.qtyconversion);
          } else {
            
            let availableForItem = cachedItems[order.item];
            order.available = Number(availableForItem);
            cachedItems[order.item] =
              Number(order.available) - Number(order.qtyconversion);


              if (order.woOneFulfillable && order.inventorytype === 'Work In Process') {
                order.available += order.qtyconversion;
              }
              if (order.woTwoFulfillable && order.inventorytype === 'Finished Goods') {
                order.available += order.qtyconversion;
              }  
          }
        });
      } else {
        temp.forEach((order) => {
          if (cachedItems[order.item]) {
            order.available = Number(cachedItems[order.item]);
          }
        });
      }
    });
    
    let output = "";
    

    for (let index = 0; index < modifiedOrders.length; index++) {
      const { date, productionorder, batch, location, workordernum, order, item, description, inventorytype, units, quantity, backordered, committed, qtyconversion, pmtacommit, nonpmtacommit, ohqnow, available, status, qtyAdded } =
        modifiedOrders[index];
      
      output += `
        <tr class="${status}">
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="date">${date}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="productionorder">${productionorder}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="batch">${batch}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="location">${location}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="workordernum">${workordernum}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="orders">${order}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="item">${item}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="description">${description}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="inventoryType">${inventorytype}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="units">${units}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="quantity">${quantity}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="backordered">${backordered}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="committed">${committed}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="qtyconversion">${qtyconversion}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="pmtacommit">${pmtacommit}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="nonpmtacommit">${nonpmtacommit}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="ohqnow">${ohqnow}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="available" style="color: ${qtyAdded ? '#0E7C7B' : 'black'}">${available}</td>
          <td data-b-a-s="thin" data-fill-color="${status === 'green' ? 'D4F4DD' : status === 'red' ? 'D62246' : 'ffffff'}" class="schedule">${status === 'green' ? 'true' : 'false'}</td>
        </tr>
      `;
    }

    dataOutput.innerHTML = output;

    isDataConverted = true;
  } catch (error) {
    alert("Please enter correct JSON data");
  }
}

function onExcelFileDownload() {
  if (isDataConverted) {
    const filename = prompt("Enter filename to save", "FulfillableOrders.csv")

    TableToExcel.convert(document.getElementById("visualized-data"), {
      name: filename,
    });
  } else {
    alert("Please process data, then download file");
  }
}


