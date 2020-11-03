import {Request, Response} from 'express';

import db from '../database/connection';
import convertHourToMinuts from '../utils/convertHourToMinuts';


interface SheduleItem {
    week_day: number; 
    from: string;
    to: string;
}

export default class ClassesController {

    async index(req: Request, res: Response){
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if(!filters.week_day || !filters.subject || !filters.time) {
            return res.status(400).json({
                error: 'Missing filters to search classes'
                             
            });
        }

        const timeInMinuts = convertHourToMinuts(time);

        const classes = await db('classes')
            .whereExists(function(){
                this.select('class_shedule.*')
                    .from('class_shedule')
                    .whereRaw('`class_shedule`.`class_id` = `classes` . `id`')
                    .whereRaw('`class_shedule`. `week_day` = ??',[Number(week_day)])
                    .whereRaw('`class_shedule`.`from` <= ??', [timeInMinuts])
                    .whereRaw('`class_shedule`.`to`  > ??', [timeInMinuts])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);


        return res.json(classes);
    }


    async create(req: Request, res: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            shedule,
        } = req.body;

    
    
        const trx = await db.transaction();
    
        try {
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            });
        
            const user_id = insertedUsersIds[0];
        
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });
            
            const class_id = insertedClassesIds;
        
            const classShedule = shedule.map((sheduleItem: SheduleItem) => {
                
                return{
                    class_id,
                    week_day: sheduleItem.week_day,
                    from: convertHourToMinuts(sheduleItem.from),
                    to: convertHourToMinuts(sheduleItem.to),
        
                };
            });
        
            await trx('class_shedule').insert(classShedule);
        
            await trx.commit();
        
        
            return res.status(201).send();
        } catch(err) {
            await trx.rollback();
    
            return res.status(400).json({
                err: 'Unexpected error while creating new class'
            });
        }
    
        
    }
};