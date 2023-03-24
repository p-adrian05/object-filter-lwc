import {api, LightningElement, track} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";

const CONDITION_AND = 'AND';
const CONDITION_OR = 'OR';
const CONDITION_CUSTOM = 'CUSTOM';
const DEFAULT_CONDITION = CONDITION_AND;
const CONDITION_LABEL_MAP = new Map([
    [CONDITION_AND,'All Conditions Are Met (AND)'],
    [CONDITION_OR,'Any Condition Is Met (OR)'],
    [CONDITION_CUSTOM,'Custom Condition Is Met (Advanced)']
]);
const OPERATOR_EQUAL = '=';
const OPERATOR_NOT_EQUAL = '!=';
const OPERATOR_LESS_THAN = '<';
const OPERATOR_GREATER_THAN = '>';
const OPERATOR_LESS_OR_EQUAL = '<=';
const OPERATOR_GREATER_OR_EQUAL = '>=';
const OPERATOR_CONTAIN = 'contain';
const OPERATOR_NOT_CONTAIN = 'not_contain';
const OPERATOR_START_WITH = 'start_with';
const OPERATOR_END_WITH = 'end_with';
const OPERATOR_LABEL_MAP = new Map([
    [OPERATOR_EQUAL,'equals'],
    [OPERATOR_NOT_EQUAL,'not equal to'],
    [OPERATOR_LESS_THAN,'less than'],
    [OPERATOR_GREATER_THAN,'greater than'],
    [OPERATOR_LESS_OR_EQUAL,'less or equal'],
    [OPERATOR_GREATER_OR_EQUAL,'greater or equal'],
    [OPERATOR_CONTAIN,'contain'],
    [OPERATOR_NOT_CONTAIN,'does not contain'],
    [OPERATOR_START_WITH,'start with'],
    [OPERATOR_END_WITH,'end with']
]);

const DEFAULT_TITLE = "Filters";
const DEFAULT_OBJECT_API_NAME= "Account";
const INVALID_CONDITION_LOGIC_WARNING_MESSAGE = 'Invalid custom logic input! It can contains only AND, OR, (,) characters.';
const INVALID_FILTER_INDEX_WARNING_MESSAGE = 'Invalid filter index!';
const NUMBER_FIELD_TYPES = ['datetime', 'date','time', 'integer', 'double', 'percent', 'number', 'currency'];
const VALID_CUSTOM_LOGIC_INPUT_CHARACTERS = ['(',')','A','N','D','O','R',' '];
export default class ObjectFilter extends LightningElement {

    @api title = DEFAULT_TITLE;
    @api objectApiName = DEFAULT_OBJECT_API_NAME;
    @track filterList = [];
    @track logicalConditions = [];
    @track operatorOptions = [];
    @track selectedLogicalCondition = DEFAULT_CONDITION;

    @track editFilter = false;

    openedFilterId;
    @track customConditionLogic = '';
    showCustomConditionLogicInput;

    @track queryString;

    @api
    getFilterState(){
        return new FilterState(this.filterList,
            this.getQueryFilterString(),
            this.selectedLogicalCondition,
            this.customConditionLogic);
    }
    @api loadFilterState(filterState){
        this.resetComponent();
        if(filterState && filterState.filterList){
            this.filterList = filterState.filterList.map(filter=>{
                return new Filter(filter.id,filter.field,filter.operator,filter.operatorValue);
            });
            this.reIndexFilters();

            if(filterState.logicalCondition === CONDITION_CUSTOM){
                this.showCustomConditionLogicInput = true;
                this.customConditionLogic = filterState.customLogicalCondition;
            }else{
                this.customConditionLogic = this.calculateLogicalOrder();
            }
            this.selectedLogicalCondition = filterState.logicalCondition;
            this.queryString = filterState.filterString;

        }
    }


    connectedCallback() {
        this.logicalConditions = this.createOptionsListFromMap(CONDITION_LABEL_MAP);
        this.operatorOptions = this.createOptionsListFromMap(OPERATOR_LABEL_MAP);
    }

    createOptionsListFromMap(mapCollection){
        let optionList = [];
        for(let key of mapCollection.keys()){
            optionList.push({label:mapCollection.get(key),value:key});
        }
        return optionList;
    }

    handleClearFilterButton(event){
        this.resetForm();

    }
    handleUpdateFilterButton(event){
        let filterForm = this.template.querySelector('c-object-filter-form');

        this.filterList.forEach(filter=>{
            if(filter.id=== this.openedFilterId){
                filter.field = filterForm.selectedField;
                filter.operator = filterForm.selectedOperator;
                filter.operatorValue = filterForm.operatorValue;
            }
        });
        this.filterList = [...this.filterList];
        this.resetForm();
        this.queryString = this.getQueryFilterString();
    }
    handleAddFilterButton(event){
        let filterForm = this.template.querySelector('c-object-filter-form');

        if(filterForm.selectedField && filterForm.selectedOperator){
            let filter = new Filter();

            filter.id = new Date().getTime()+this.filterList.length+1;
            filter.field = filterForm.selectedField;
            filter.operator = filterForm.selectedOperator;
            filter.operatorValue = filterForm.operatorValue;

            this.filterList.push(filter);
            this.filterList = [...this.filterList];

            this.reIndexFilters();
            this.resetForm();
            this.customConditionLogic = this.calculateLogicalOrder();
            this.queryString = this.getQueryFilterString();
        }
    }
    handleSelectFilter(event){
        let indexToSelect = this.findFilterById(event.detail.filterId);
        if(indexToSelect!==-1){
            let filterToLoad = this.filterList.at(indexToSelect);
            this.template.querySelector('c-object-filter-form').loadFilter(filterToLoad);

            this.editFilter = true;
            this.openedFilterId = filterToLoad.id;
        }
    }
    handleClearAllButton(event){
      this.resetComponent();
    }
    resetComponent(){
        this.resetForm();
        this.filterList = [];
        this.queryString = null;
        this.customConditionLogic = '';
        this.selectedLogicalCondition = DEFAULT_CONDITION;
        this.showCustomConditionLogicInput = false;
    }
    handleRemoveFilter(event){
        let indexToDelete = this.findFilterById(event.detail.filterId);
        if(indexToDelete!==-1){
             this.filterList.splice(indexToDelete,1);
             this.reIndexFilters();
             this.filterList = [...this.filterList];
             this.customConditionLogic = this.calculateLogicalOrder();
             this.queryString = this.getQueryFilterString();
        }
    }

    findFilterById(filterId){
       return this.filterList.findIndex(filter=>filter.id.toString()===filterId.toString());
    }

    resetForm(){
        let filterForm = this.template.querySelector('c-object-filter-form');
        filterForm.resetForm();
        this.editFilter = false;
        this.openedFilterId = null;
    }
    reIndexFilters(){
        let index = 1;
        this.filterList.forEach(filter =>{
            filter.index = index++;
        });
    }
    handleCustomConditionLogicInput(event){
        if(event.detail.value.trim().length===0){
            this.customConditionLogic = this.calculateLogicalOrder();
            this.queryString = this.getQueryFilterString();
        }else{
            if(!this.validateCustomConditionLogicInput(event.detail.value.trim())){
                this.showWarningMessage(INVALID_CONDITION_LOGIC_WARNING_MESSAGE);
            }else{
                this.customConditionLogic = event.detail.value;
                this.queryString = this.getQueryFilterString();
            }
        }
    }
    validateCustomConditionLogicInput(inputString){
        if(!inputString){
            return false;
        }
        let isValid = true;
        for(let i=0;i<inputString.length;i++){
            inputString = inputString.toUpperCase();
            let currentChar = inputString.charAt(i);
            if(isNaN(currentChar) && !VALID_CUSTOM_LOGIC_INPUT_CHARACTERS.includes(currentChar)){
                isValid = false;
            }
        }
        return isValid;
    }
    handleLogicalConditionSelected(event){
        this.selectedLogicalCondition = event.detail.value;
        this.showCustomConditionLogicInput = event.detail.value === CONDITION_CUSTOM;

        this.customConditionLogic = this.calculateLogicalOrder();
        this.queryString = this.getQueryFilterString();

    }
    calculateLogicalOrder(){
        let logicalCondition = this.selectedLogicalCondition;
        if(this.selectedLogicalCondition===CONDITION_CUSTOM){
            logicalCondition = DEFAULT_CONDITION;
        }
        let orderStr = '';
        if(this.filterList.length===1){
            return '1';
        }
        for(let i = 0; i<this.filterList.length-1;i++){
            orderStr +=  (i+1) +' '+logicalCondition+' '+(i+2)+' ';

            if(this.filterList.length%2===0){
                let nextLogicalOperator = '';
                if(this.filterList.at(i+2)!==undefined){
                    nextLogicalOperator = logicalCondition;
                }
                orderStr += nextLogicalOperator+' ';
            }else{
                orderStr += logicalCondition+' ';
                if(this.filterList.at(i+3)===undefined){
                    orderStr += ' '+ (i+3)+' ';
                }
            }
            i++;
        }
        return orderStr;
    }

    @api getQueryFilterString(){
        let filterQuery = '';
        try{
            for(let i = 0; i<this.customConditionLogic.length;i++){
                let charCode = this.customConditionLogic.charCodeAt(i);
                let nextCharCode = this.customConditionLogic.charCodeAt(i+1);
                let actualStringIndexOfFilter = '';

                if(charCode>48 && charCode<58){
                    actualStringIndexOfFilter += String.fromCharCode(charCode);
                    if(nextCharCode>=48 && nextCharCode<58){
                        actualStringIndexOfFilter += String.fromCharCode(nextCharCode);
                        i++;
                    }
                    let indexOfFilter = Number.parseInt(actualStringIndexOfFilter);
                    let filter = this.filterList.at(indexOfFilter-1);
                    if(!filter){
                        this.showWarningMessage(INVALID_FILTER_INDEX_WARNING_MESSAGE);
                        return filterQuery;
                    }else{
                        filterQuery+= filter.toString();
                    }
                }else{
                    filterQuery+=String.fromCharCode(charCode);
                }
            }
        }catch (e){
            console.log(JSON.stringify(e));
        }

        return filterQuery;
    }
     showWarningMessage(message,title) {
        if(!title) title = 'Warning!';
        const event = new ShowToastEvent({variant: 'warning', title: title, message: String(message)});
        dispatchEvent(event)
    }



}
class FilterState{

    filterList = [];
    filterString;
    logicalCondition;
    customLogicalCondition;

    constructor(filterList,filterString,logicalCondition,customLogicalCondition) {
        this.filterList = filterList;
        this.filterString = filterString;
        this.logicalCondition = logicalCondition;
        this.customLogicalCondition = customLogicalCondition;
    }

}
class Filter{
    id='';
    index='';
    field;
    operator ='';
    operatorValue='';

    constructor(id,field,operator,operatorValue) {
        this.id = id;
        this.field = field;
        this.operator = operator;
        this.operatorValue = operatorValue;
    }

    toString(){
        let numberFieldTypes = NUMBER_FIELD_TYPES;
        let tempQuery ='';
        if(!this.operatorValue || this.operatorValue.trim() === ""){
            this.operatorValue = "";
        }
        if(this.operator === OPERATOR_CONTAIN) {
            tempQuery= ' '+this.field.apiName +' like '+"'%"+this.operatorValue+"%'";
        } else if(this.operator === OPERATOR_NOT_CONTAIN) {
            tempQuery= ' (not '+this.field.apiName +' like '+"'%"+this.operatorValue+"%' )";
        }
        else if(this.operator === OPERATOR_START_WITH) {
            tempQuery= ' '+this.field.apiName +' like '+"'"+this.operatorValue+"%'";
        }
        else if(this.operator === OPERATOR_END_WITH) {
            tempQuery= ' '+this.field.apiName +' like '+"'%"+this.operatorValue+"'";
        }
        else {
            tempQuery= ' '+this.field.apiName +' '+this.operator+' '+"'"+this.operatorValue+"'";
        }
        if(numberFieldTypes.includes(this.field.type.toLowerCase())) {
            tempQuery = tempQuery.replaceAll("'", " ");
        }
        return tempQuery;
    }
}