
public with sharing class Field {
    public String apiName;
    public String labelName;
    public String type;

    public Field(String apiName, String labelName,String type) {
        this.apiName = apiName;
        this.labelName = labelName;
        this.type = type;
    }
}