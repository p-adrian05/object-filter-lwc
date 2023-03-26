# Object Filter LWC
Provides a dynamic multi-filter component for any object.

<a href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04t7Q000000YyywQAC">
<img alt="Deploy to Salesforce" src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

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
         "id":1679649831842,
         "index":1,
         "field":{
            "apiName":"Amount",
            "labelName":"Amount",
            "type":"CURRENCY"
         },
         "operator":">",
         "operatorValue":"12"
      },
      {
         "id":1679649886747,
         "index":2,
         "field":{
            "apiName":"Name",
            "labelName":"Name",
            "type":"STRING"
         },
         "operator":"contain",
         "operatorValue":"test"
      }
   ],
   "filterString":"Amount >  12  AND  Name like '%test%'",
   "logicalCondition":"AND",
   "customLogicalCondition":"1 AND 2"
}
```
- loadFilterState(filterState) - load the FilterState object to the component.
- getQueryFilterString() - return the filterString value of the component.
## Images
![img.png](/documantation/images/objectFilterEmpty.png)
![img.png](/documantation/images/objectFilterSelectField.png)
![img.png](/documantation/images/objectFilterWithOperator.png)
![img.png ](/documantation/images/objectFilterUpdate.png)
![img.png ](/documantation/images/objectFilterORCondition.png)
![img.png](/documantation/images/objectFilterCustomCondition.png)
