import WarhammerScript from "../../system/script";
import { AvoidTestModel } from "./avoidTest";

let fields = foundry.data.fields;

export class WarhammerActiveEffectModel extends foundry.abstract.DataModel 
{

    static _avoidTestModel = AvoidTestModel;

    static defineSchema() 
    {
        let schema = {};
        schema.transferData = new fields.SchemaField({
            type: new fields.StringField({initial : "document"}),
            documentType: new fields.StringField({initial: "Actor"}),
            avoidTest: new fields.EmbeddedDataField(this._avoidTestModel),
            testIndependent: new fields.BooleanField({ initial: false }),
            preApplyScript: new fields.StringField({}),  // A script that runs before an effect is applied - this runs on the source, not the target
            equipTransfer: new fields.BooleanField({ initial: false }),
            enableConditionScript: new fields.StringField({}),
            filter: new fields.StringField({}),
            prompt: new fields.BooleanField({ initial: false }),
            itemTargetIDs: new fields.ArrayField(new fields.StringField({}, { nullable: true }))
        });

        schema.scriptData = new fields.ArrayField(new fields.SchemaField({
            script: new fields.StringField(),
            label: new fields.StringField(),
            trigger: new fields.StringField(),
            options: new fields.SchemaField({
                targeter: new fields.BooleanField({initial : false}),
                hideScript: new fields.StringField({}),
                activateScript: new fields.StringField({}),
                submissionScript: new fields.StringField({}),
                deleteEffect: new fields.BooleanField({initial : false}),
            }),
            async: new fields.BooleanField()
        }));

        schema.zone = new fields.SchemaField({
            type: new fields.StringField(), // previously "Zone type"
            //TODO
        });
        
        schema.area = new fields.SchemaField({
            aura: new fields.BooleanField({ initial: false }),
            radius: new fields.StringField({ nullable: true }), // Area/Aura radius, if null, inherit from item
            transferred : new fields.BooleanField({initial : false}),
            render: new fields.BooleanField({ initial: true }), // Whether or not to render the measured template
            templateData: new fields.ObjectField(),

            keep: new fields.BooleanField({ initial: false }), // Area/Aura - should they keep the effect when leaving

            duration: new fields.StringField({ initial: "sustained" }), // Area - "instantaneous" or "sustained"
        });

        schema.sourceData = new fields.SchemaField({
            zone : new fields.StringField(),
            item: new fields.StringField(),
            test: new fields.ObjectField(),
        });


        return schema;
    }

    static avoidTestModel() 
    {

    }

    get scripts() 
    {
        if (!this._scripts) 
        {
            this._scripts = this.scriptData.map(s => new WarhammerScript(s, WarhammerScript.createContext(this.parent)));
        }
        return this._scripts;
    }

    get manualScripts() 
    {
        return this.scripts.filter(i => i.trigger == "manual").map((script, index) => 
        {
            script.index = index; // When triggering manual scripts, need to know the index (listing all manual scripts on an actor is messy)
            return script;
        });
    }

    get filterScript() 
    {
        if (this.transferData.filter) 
        {
            try 
            {
                return new WarhammerScript({ script: this.transferData.filter, label: `${this.name} Filter` }, WarhammerScript.createContext(this));
            }
            catch (e) 
            {
                console.error("Error creating filter script: " + e);
                return null;
            }
        }
        else { return null; }
    }

    get testIndependent() 
    {
        return this.transferData.testIndependent;
    }

    get isTargetApplied() 
    {
        return this.transferData.type == "target" || (this.transferData.type == "aura" && this.transferData.targetedAura);
    }

    get isAreaApplied() 
    {
        return this.transferData.type == "area";
    }

    get isCrewApplied() 
    {
        return this.transferData.type == "crew";
    }

    get itemTargets() 
    {
        let ids = this.itemTargetsData;
        if (ids.length == 0) 
        {
            return this.actor.items.contents;
        }
        else 
        {
            return ids.map(i => this.actor.items.get(i));
        }
    }

}
