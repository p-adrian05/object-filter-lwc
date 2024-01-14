# Object Filter LWC
Provides a dynamic multi-filter Lightning Web Component for any Salesforce SObject.

### Attributes
- object-api-name attribute is required, default is "Account". If using in record detail page, it will be the record object api name of the page automatically.
- title attribute is optional, default is "Filters".
```javascript
<c-object-filter 
    object-api-name="Account"
    title="Filters">
</c-object-filter>
```
### Invocable methods
- getFilterState() - return the FilterState object of the component.
    - Example of the FilterState object as JSON:
```json
{
  "filterList":[
    {
      "id":1680248239260,
      "index":1,
      "field":{
        "apiName":"Amount",
        "labelName":"Amount",
        "type":"CURRENCY"
      },
      "operator":">",
      "operatorValue":"12",
      "bindVariable":"value1"
    },
    {
      "id":1680248266240,
      "index":2,
      "field":{
        "apiName":"Name",
        "labelName":"Name",
        "type":"STRING"
      },
      "operator":"like",
      "operatorValue":"%test%",
      "bindVariable":"value2"
    }
  ],
  "filterString":"Amount > 12 AND  Name like '%test%'",
  "filterStringWithBinds":"Amount > :value1 AND  Name like :value2",
  "logicalCondition":"AND",
  "logicalOrder":"1 AND 2"
}
```
- loadFilterState(filterState) - load the FilterState object to the component.
- getQueryFilterString() - return the filterString value of the component.
## Images
![img.png](./documantation/images/img.png)
![img.png](./documantation/images/img_1.png)
![img.png](./documantation/images/img_2.png)
![img.png](./documantation/images/img_3.png)