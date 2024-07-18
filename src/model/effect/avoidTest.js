let fields = foundry.data.fields;

export class AvoidTestModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.value = new fields.StringField({initial : "none"}),
        schema.opposed = new fields.BooleanField({initial : false});
        schema.prevention = new fields.BooleanField({initial : true});
        schema.reversed = new fields.BooleanField({initial : false});
        schema.manual = new fields.BooleanField({initial : false});
        schema.script = new fields.StringField({});

        return schema;
    }
}